import TextComparison from '../TextComparison';

export default function TextComparisonExample() {
  // TODO: remove mock functionality
  const mockOriginalText = [
    { text: 'Academic integrity is fundamental to the pursuit of knowledge. ', isHighlighted: true, similarityLevel: 'exact' as const },
    { text: 'Students must demonstrate original thinking ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'and proper citation practices ', isHighlighted: true, similarityLevel: 'similar' as const },
    { text: 'in their research work. Original contributions are essential ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'for advancing academic discourse. ', isHighlighted: true, similarityLevel: 'paraphrased' as const }
  ];

  const mockSourceText = [
    { text: 'Academic integrity is fundamental to the pursuit of knowledge. ', isHighlighted: true, similarityLevel: 'exact' as const },
    { text: 'Researchers must show creative thinking ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'and appropriate referencing methods ', isHighlighted: true, similarityLevel: 'similar' as const },
    { text: 'throughout their scholarly activities. Novel ideas are crucial ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'for the progression of academic conversation. ', isHighlighted: true, similarityLevel: 'paraphrased' as const }
  ];

  const handleBack = () => {
    console.log('Back to report clicked');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <TextComparison
        originalText={mockOriginalText}
        sourceText={mockSourceText}
        sourceName="wikipedia.org/wiki/Academic_integrity"
        sourceType="web"
        overallSimilarity={67}
        onBack={handleBack}
      />
    </div>
  );
}