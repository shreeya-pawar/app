import React, { useEffect, useState } from 'react';
import socket from '../socket';

function PollResults() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    socket.on('poll_results', (data) => {
      setResults(data);
    });

    return () => {
      socket.off('poll_results');
    };
  }, []);

  if (!results) return <h2 style={{ textAlign: 'center', marginTop: '10%' }}>Waiting for results...</h2>;

  const totalResponses = results.responses.length;
  const optionCounts = new Array(results.options.length).fill(0);
  const correctOption = results.correctIndex;


  results.responses.forEach((r) => {
    optionCounts[r.option]++;
  });

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', marginTop: '5%' }}>
      <h2>Results</h2>
      <p><strong>Question:</strong> {results.question}</p>

      {results.options.map((opt, idx) => {
        const percent = totalResponses > 0
          ? Math.round((optionCounts[idx] / totalResponses) * 100)
          : 0;
        const isCorrect = idx === correctOption;
        return (
          <div key={idx} style={{
            backgroundColor: isCorrect ? '#c8f7c5' : '#f0f0f0',
            padding: '10px',
            marginBottom: '5px',
            borderRadius: '6px'
          }}>
            <strong>{opt}</strong> - {percent}%
            {isCorrect && ' ✅'}
          </div>
        );
      })}

      <br />
      <h4>Correct Respondents:</h4>
      <ul>
        {results.responses
          .filter(r => r.option === correctOption)
          .map((r, idx) => <li key={idx}>{r.name}</li>)}
      </ul>
    </div>
  );
}

export default PollResults;
