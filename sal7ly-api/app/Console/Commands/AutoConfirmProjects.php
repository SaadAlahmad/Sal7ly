<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('projects:auto-confirm')]
#[Description('Auto-confirm projects that have passed their auto_complete_at deadline.')]
class AutoConfirmProjects extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projects = Project::where('status', 'pending_completion')
            ->whereNotNull('auto_complete_at')
            ->where('auto_complete_at', '<=', now())->get();
        foreach($projects as $project) {
            $project->status = 'completed';
            $project->completed_at = now();
            $project->save();

            $this->info("Project {$project->id} auto-confirmed.");
        }
        $this->info("Auto-confirm complete. {$projects->count()} projects confirmed.");
    }
}
