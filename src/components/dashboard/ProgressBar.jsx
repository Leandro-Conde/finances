function ProgressBar({ percentage }) {
    const progress = Math.min(percentage, 100);
  
    return (
      <div className="progress-container">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
    );
  }
  
  export default ProgressBar;