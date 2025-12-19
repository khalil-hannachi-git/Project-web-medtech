import React from 'react';

const QuizzView = ({ quiz, onClose }) => {
  if (!quiz) return null; // Nothing to show

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded w-11/12 max-w-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{quiz.name}</h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-4">Quiz ID: {quiz.quizId}</p>

        {quiz.questions.map((q, idx) => (
          <div key={idx} className="mb-4 p-3 border rounded bg-gray-800">
            <p className="font-medium mb-2">
              {idx + 1}. {q.question}
            </p>
            <ul className="list-disc list-inside">
              {['a', 'b', 'c', 'd'].map((opt) => (
                <li key={opt}>{q.options[opt]}</li>
              ))}
            </ul>
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QuizzView;
