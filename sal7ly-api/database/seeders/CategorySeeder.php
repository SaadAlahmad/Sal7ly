<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Plumbing',          'icon' => 'wrench', 'description' => 'Pipe installation, repairs, and maintenance'],
            ['name' => 'Electrical',         'icon' => 'zap', 'description' => 'Wiring, fixtures, and electrical repairs'],
            ['name' => 'Carpentry',          'icon' => 'hammer', 'description' => 'Furniture, woodwork, and structural carpentry'],
            ['name' => 'Painting',           'icon' => 'paint-roller', 'description' => 'Interior and exterior painting'],
            ['name' => 'Tiling',             'icon' => 'grid-2x2', 'description' => 'Floor and wall tile installation'],
            ['name' => 'HVAC',               'icon' => 'wind', 'description' => 'Heating, ventilation, and air conditioning'],
            ['name' => 'Masonry',            'icon' => 'layers', 'description' => 'Brickwork, concrete, and stonework'],
            ['name' => 'Welding',            'icon' => 'flame', 'description' => 'Metal fabrication and welding repairs'],
            ['name' => 'Cleaning',           'icon' => 'sparkles', 'description' => 'Deep cleaning and housekeeping services'],
            ['name' => 'Landscaping',        'icon' => 'trees', 'description' => 'Garden design, maintenance, and outdoor work'],
            ['name' => 'Home Appliances',    'icon' => 'plug', 'description' => 'Repair and installation of home appliances'],
            ['name' => 'Moving',             'icon' => 'package', 'description' => 'Furniture moving and relocation services'],
            ['name' => 'Security Systems',   'icon' => 'lock', 'description' => 'Camera and alarm system installation'],
            ['name' => 'Roofing',            'icon' => 'house', 'description' => 'Roof installation, repair, and waterproofing'],
            ['name' => 'General Handyman',   'icon' => 'toolbox', 'description' => 'Miscellaneous repairs and odd jobs'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name'        => $category['name'],
                'slug'        => Str::slug($category['name']),
                'icon'        => $category['icon'],
                'description' => $category['description'],
                'created_at'  => now(),
            ]);
        }
    }
}
