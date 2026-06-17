import TextComparison from '../TextComparison';
export default function TextComparisonExample() {
    // TODO: remove mock functionality
    const mockOriginalText = [
        { text: 'Academic integrity is fundamental to the pursuit of knowledge. ', isHighlighted: true, similarityLevel: 'exact' },
        { text: 'Students must demonstrate original thinking ', isHighlighted: false, similarityLevel: 'exact' },
        { text: 'and proper citation practices ', isHighlighted: true, similarityLevel: 'similar' },
        { text: 'in their research work. Original contributions are essential ', isHighlighted: false, similarityLevel: 'exact' },
        { text: 'for advancing academic discourse. ', isHighlighted: true, similarityLevel: 'paraphrased' }
    ];
    const mockSourceText = [
        { text: 'Academic integrity is fundamental to the pursuit of knowledge. ', isHighlighted: true, similarityLevel: 'exact' },
        { text: 'Researchers must show creative thinking ', isHighlighted: false, similarityLevel: 'exact' },
        { text: 'and appropriate referencing methods ', isHighlighted: true, similarityLevel: 'similar' },
        { text: 'throughout their scholarly activities. Novel ideas are crucial ', isHighlighted: false, similarityLevel: 'exact' },
        { text: 'for the progression of academic conversation. ', isHighlighted: true, similarityLevel: 'paraphrased' }
    ];
    const handleBack = () => {
        console.log('Back to report clicked');
    };
    return (<div className="max-w-6xl mx-auto p-6">
      <TextComparison originalText={mockOriginalText} sourceText={mockSourceText} sourceName="wikipedia.org/wiki/Academic_integrity" sourceType="web" overallSimilarity={67} onBack={handleBack}/>
    </div>);
}
