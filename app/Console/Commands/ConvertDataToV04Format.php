<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

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
            $this->error("`data.json` doesn't exist in this folder");
            return;
        }
        
        $fileContents = file_get_contents($path);
        if (empty($fileContents)) {
            $this->error("`data.json` is empty");
            return;
        }
        
        $json = json_decode($fileContents, true);
        if (
            empty($json)
        ) {
            $this->error("`data.json` is invalid");
            return;
        }
        
        $this->info("Converting data to v0.4 format");
        $convertedData = $this->convertData($json);
    
        $this->info("Saving data to `data-converted.json`");
        file_put_contents("data-converted.json", json_encode($convertedData));
    }
    
    public function convertData(array $json): array
    {
        return [
            "postsModule" => [
                "posts" => $json["postsModule"]["posts"],
                "links" => collect($json["postsModule"]["links"])
                    ->mapWithKeys(function (array $link) {
                        $link["graph"] = 1;
                        return [$link["id"] => $link];
                    })->toArray(),
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
                        "subgraphs" => array_keys($json["postsModule"]["graphs"])
                    ]
                ],
                "subgraphs" => collect($json["postsModule"]["graphs"])
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
                    ->toArray(),
                
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
