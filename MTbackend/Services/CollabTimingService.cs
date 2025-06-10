using Microsoft.EntityFrameworkCore;
using MTbackend.Models;

namespace MTbackend.Services;

public class CollabTimingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CollabTimingService> _logger;

    public CollabTimingService(IServiceProvider serviceProvider, ILogger<CollabTimingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessCollabTransitions();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing collab transitions");
            }

            // Check every minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task ProcessCollabTransitions()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        
        // Get all released collabs that are not yet completed
        var collabs = await context.Collabs
            .Include(c => c.Submissions)
            .Where(c => c.Released && !c.Completed && c.ReleaseTime.HasValue)
            .ToListAsync();

        foreach (var collab in collabs)
        {
            await ProcessCollabTransition(context, collab, now);
        }

        await context.SaveChangesAsync();
    }

    private async Task ProcessCollabTransition(AppDbContext context, Collab collab, DateTime now)
    {
        switch (collab.Stage)
        {
            case CollabStage.Submission:
                await HandleSubmissionPhaseEnd(context, collab, now);
                break;
            case CollabStage.Voting:
                await HandleVotingPhaseEnd(context, collab, now);
                break;
        }
    }

    private async Task HandleSubmissionPhaseEnd(AppDbContext context, Collab collab, DateTime now)
    {
        // Check if submission phase has ended
        if (collab.SubmissionEndTime.HasValue && now >= collab.SubmissionEndTime.Value)
        {
            var submissionCount = collab.Submissions.Count;
            
            if (submissionCount == 0)
            {
                // No submissions received - complete the collab
                collab.Stage = CollabStage.Completed;
                collab.Completed = true;
                collab.CompletionReason = "NoSubmissions";
                
                _logger.LogInformation("Collab {CollabId} completed with no submissions", collab.Id);
            }
            else
            {
                // Move to voting stage
                collab.Stage = CollabStage.Voting;
                
                _logger.LogInformation("Collab {CollabId} moved to voting stage with {SubmissionCount} submissions", 
                    collab.Id, submissionCount);
            }
        }
    }

    private async Task HandleVotingPhaseEnd(AppDbContext context, Collab collab, DateTime now)
    {
        // Check if voting phase has ended
        if (collab.VotingEndTime.HasValue && now >= collab.VotingEndTime.Value)
        {
            await CalculateResults(context, collab);
            
            collab.Stage = CollabStage.Completed;
            collab.Completed = true;
            collab.CompletionReason = "VotingComplete";
            
            _logger.LogInformation("Collab {CollabId} completed after voting phase", collab.Id);
        }
    }

    private async Task CalculateResults(AppDbContext context, Collab collab)
    {
        // Get vote counts for each submission
        var submissionVotes = await context.Submissions
            .Where(s => s.CollabId == collab.Id)
            .Select(s => new
            {
                Submission = s,
                VoteCount = context.Favorites
                    .Where(f => f.SubmissionId == s.Id && f.IsFinalChoice == true)
                    .Count()
            })
            .ToListAsync();

        if (submissionVotes.Any())
        {
            // Find the submission with the most votes
            var winner = submissionVotes
                .OrderByDescending(sv => sv.VoteCount)
                .ThenBy(sv => sv.Submission.CreatedAt) // In case of tie, earliest submission wins
                .First();

            if (winner.VoteCount > 0)
            {
                collab.WinningSubmissionId = winner.Submission.Id;
                _logger.LogInformation("Collab {CollabId} winner: Submission {SubmissionId} with {VoteCount} votes", 
                    collab.Id, winner.Submission.Id, winner.VoteCount);
            }
            else
            {
                _logger.LogInformation("Collab {CollabId} completed with no votes received", collab.Id);
            }
        }
    }
} 