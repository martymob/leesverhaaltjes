import { useState, useEffect } from 'react';

function QuizSection({
  questions,
  isLoading,
  onComplete,
  onGenerateQuestions
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  // Reset als nieuwe vragen komen
  useEffect(() => {
    if (questions && questions.length > 0) {
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setAnswers([]);
      setIsFinished(false);
    }
  }, [questions]);

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return; // Voorkom dubbel klikken

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswers(prev => [...prev, {
      questionIndex: currentQuestion,
      selected: answerIndex,
      correct: questions[currentQuestion].correct,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      onComplete({
        score,
        total: questions.length,
        answers,
        isPerfect: score === questions.length
      });
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setIsFinished(false);
  };

  // Geen vragen
  if (!questions || questions.length === 0) {
    return (
      <section className="quiz-section">
        <h2>❓ Begripsvragen</h2>
        <div className="quiz-empty">
          <p>Wil je vragen maken over dit verhaal?</p>
          <button
            className="btn-primary"
            onClick={onGenerateQuestions}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Vragen maken...' : '🎯 Maak vragen!'}
          </button>
        </div>
      </section>
    );
  }

  // Quiz voltooid
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPerfect = score === questions.length;

    return (
      <section className="quiz-section">
        <h2>🏆 Quiz Klaar!</h2>

        <div className="quiz-result">
          <div className={`result-score ${isPerfect ? 'perfect' : score >= questions.length / 2 ? 'good' : 'try-again'}`}>
            <span className="score-number">{score}/{questions.length}</span>
            <span className="score-label">
              {isPerfect ? '🌟 Perfect!' : score >= questions.length / 2 ? '👍 Goed gedaan!' : '💪 Blijf oefenen!'}
            </span>
          </div>

          {/* Confetti effect bij perfect */}
          {isPerfect && (
            <div className="confetti">
              {'🎉⭐🌟✨🎊'.split('').map((emoji, i) => (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    '--delay': `${i * 0.1}s`,
                    '--x': `${Math.random() * 100}%`
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}

          {/* Antwoorden overzicht */}
          <div className="answers-review">
            <h3>Jouw antwoorden:</h3>
            {answers.map((answer, idx) => (
              <div
                key={idx}
                className={`answer-review ${answer.isCorrect ? 'correct' : 'wrong'}`}
              >
                <span className="review-icon">
                  {answer.isCorrect ? '✅' : '❌'}
                </span>
                <span className="review-question">
                  {questions[answer.questionIndex].vraag}
                </span>
              </div>
            ))}
          </div>

          <div className="quiz-actions">
            <button className="btn-secondary" onClick={handleRetry}>
              🔄 Opnieuw proberen
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Huidige vraag
  const question = questions[currentQuestion];

  return (
    <section className="quiz-section">
      <div className="quiz-header">
        <h2>❓ Begripsvragen</h2>
        <span className="quiz-progress">
          Vraag {currentQuestion + 1} van {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-question">
        <p className="question-text">{question.vraag}</p>

        <div className="answer-options">
          {question.opties.map((optie, idx) => {
            let optionClass = 'answer-option';

            if (showResult) {
              if (idx === question.correct) {
                optionClass += ' correct';
              } else if (idx === selectedAnswer && idx !== question.correct) {
                optionClass += ' wrong';
              }
            } else if (idx === selectedAnswer) {
              optionClass += ' selected';
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleAnswerSelect(idx)}
                disabled={showResult}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{optie}</span>
                {showResult && idx === question.correct && (
                  <span className="option-icon">✓</span>
                )}
                {showResult && idx === selectedAnswer && idx !== question.correct && (
                  <span className="option-icon">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback na antwoord */}
        {showResult && (
          <div className={`quiz-feedback ${selectedAnswer === question.correct ? 'correct' : 'wrong'}`}>
            <span className="feedback-icon">
              {selectedAnswer === question.correct ? '🎉' : '💪'}
            </span>
            <span className="feedback-text">
              {selectedAnswer === question.correct
                ? 'Goed zo!'
                : `Het goede antwoord is: ${question.opties[question.correct]}`
              }
            </span>
          </div>
        )}

        {/* Volgende knop */}
        {showResult && (
          <button className="btn-primary quiz-next" onClick={handleNext}>
            {currentQuestion < questions.length - 1 ? 'Volgende vraag →' : 'Bekijk resultaat 🏆'}
          </button>
        )}
      </div>

      {/* Score tot nu toe */}
      <div className="quiz-current-score">
        Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
      </div>
    </section>
  );
}

export default QuizSection;
