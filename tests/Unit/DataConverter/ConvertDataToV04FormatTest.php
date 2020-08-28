<?php
declare(strict_types=1);


namespace Tests\Unit\DataConverter;


use App\Console\Commands\ConvertDataToV04Format;
use Tests\TestCase;

class ConvertDataToV04FormatTest extends TestCase
{
    /**
     * @test
     */
    public function should_convert_data_to_v04_format()
    {
        $json = json_decode(file_get_contents(__DIR__ . "/" . "data.json"), true);
        $converter = new ConvertDataToV04Format();
        $convertedData = $converter->convertData($json);
        
        $expectedJson = json_decode(file_get_contents(__DIR__ . "/" . "data-converted.json"), true);
        $this->assertEquals($expectedJson, $convertedData);
    }
}