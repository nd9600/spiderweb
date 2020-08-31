<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use stdClass;

class ConvertDataToV04Format extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert_data_to_v0.4_format';

    protected $description = 'Converts an exported data file to the format needed by v >= 0.4';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info("Loading data from file `data.json`");
    
        $path = __DIR__ . "/" . "data.json";
        if (!file_exists($path)) {
            $this->error("$path` doesn't exist");
            return;
        }
        
        $fileContents = file_get_contents($path);
        if (empty($fileContents)) {
            $this->error("$path is empty");
            return;
        }
        
        $json = json_decode($fileContents, true);
        if (
            empty($json)
            || empty($json["postsModule"])
            || empty($json["settingsModule"])
            || empty($json["firebaseModule"])
        ) {
            $this->error("$path is invalid, please check it");
            return;
        }
        
        $this->info("Converting data to v0.4 format");
        $convertedData = $this->convertData($json);
    
        $savingPath = __DIR__ . "/" . "data-converted.json";
        $this->info("Saving data to $savingPath");
        file_put_contents($savingPath, json_encode($convertedData));
    }
    
    public function convertData(array $json): array
    {
        $posts = collect($json["postsModule"]["posts"])
            ->mapWithKeys(function (array $post) {
                $post["createdAt"] = $post["created_at"];
                $post["updatedAt"] = $post["updated_at"];
                unset($post["created_at"]);
                unset($post["updated_at"]);
                return [$post["id"] => $post];
            })->toArray();
        $posts = empty($posts) // PHP decodes an empty JSON object to an array, but we want this to be an object
            ? new stdClass()
            : $posts;
        
        $links = collect($json["postsModule"]["links"])
            ->mapWithKeys(function (array $link) {
                $link["graph"] = 1;
                return [$link["id"] => $link];
            })->toArray();
        $links = empty($links)
            ? new stdClass()
            : $links;
        
        $subgraphs = collect($json["postsModule"]["graphs"])
            ->map(function (array $graph) use ($json) {
                $graph["links"] = collect($json["postsModule"]["links"])
                    ->filter(function (array $link) use ($graph) {
                        return $link["graph"] === $graph["id"];
                    })
                    ->values()
                    ->map(function (array $link) {
                        return $link["id"];
                    })
                    ->toArray();
                return $graph;
            })
            ->unique()
            ->toArray();
        $subgraphs = empty($subgraphs)
            ? new stdClass()
            : $subgraphs;
        
        return [
            "dataModule" => [
                "posts" => $posts,
                "links" => $links,
                "graphs" => [
                    "1" => [
                        "id" => 1,
                        "name" => "default",
                        "nodes" => collect($json["postsModule"]["graphs"])
                            ->flatMap(function (array $graph) {
                                return $graph["nodes"];
                            })
                            ->unique()
                            ->toArray(),
                        "nodePositions" => new stdClass(),
                        "subgraphs" => array_keys($json["postsModule"]["graphs"])
                    ]
                ],
                "subgraphs" => $subgraphs,
                
                "selectedPostIds" => $json["postsModule"]["selectedPostIds"],
                "selectedGraphId" => empty($json["postsModule"]["selectedGraphIds"])
                    ? null
                    : 1,
                "selectedSubgraphIds" => $json["postsModule"]["selectedGraphIds"]
            ],
            "settingsModule" => $json["settingsModule"],
            "firebaseModule" => $json["firebaseModule"],
        ];
    }
}
