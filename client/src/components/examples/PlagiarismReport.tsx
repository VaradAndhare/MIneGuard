import PlagiarismReport from '../PlagiarismReport';

export default function PlagiarismReportExample() {
  // TODO: remove mock functionality
  const mockMatches = [
    {
      id: '1',
      source: 'wikipedia.org/wiki/Academic_integrity',
      similarity: 87,
      matchedText: 'Academic integrity is the pursuit of scholarly activity in an open, honest and responsible manner.',
      sourceType: 'web' as const
    },
    {
      id: '2', 
      source: 'Previous submission - John Smith',
      similarity: 45,
      matchedText: 'The importance of original research cannot be overstated in academic environments.',
      sourceType: 'submission' as const
    },
    {
      id: '3',
      source: 'Journal of Educational Research',
      similarity: 23,
      matchedText: 'Students must demonstrate original thinking and proper citation practices.',
      sourceType: 'database' as const
    }
  ];

  const handleViewDetails = (matchId: string) => {
    console.log('View details for match:', matchId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PlagiarismReport
        fileName="Research_Paper_Final.docx"
        overallSimilarity={32}
        wordCount={2847}
        uniqueWords={1923}
        matches={mockMatches}
        onViewDetails={handleViewDetails}
        processingTime={3.7}
      />
    </div>
  );
}