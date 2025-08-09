import { useState, useEffect, useRef } from 'react';

const TimeLogModal = ({ isOpen, onClose, taskId, onSubmit, taskTitle }) => {
  const [timeToAdd, setTimeToAdd] = useState(0);
  const [clockAngle, setClockAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  const drawClock = (angle) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw clock face
      ctx.beginPath();
      ctx.arc(100, 100, 90, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.closePath();

      // Draw center
      ctx.beginPath();
      ctx.arc(100, 100, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();

      // Draw needle (adjusted for clock-like behavior, 0° at 12 o'clock)
      const angleRad = (angle - 90) * Math.PI / 180; // -90 to align 0° with 12 o'clock
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(100 + 80 * Math.cos(angleRad), 100 + 80 * Math.sin(angleRad));
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e50914';
      ctx.stroke();
      ctx.closePath();
    }
  };

  useEffect(() => {
    if (isOpen) drawClock(clockAngle);
  }, [isOpen, clockAngle]);

  const handleMouseDown = (e) => {
    console.log('Mouse down at:', e.clientX, e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging && canvasRef.current) {
      console.log('Mouse moving at:', e.clientX, e.clientY);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI); // Angle in degrees
      angle = ((angle + 360) % 360 + 90) % 360; // Normalize and shift 0° to 3 o'clock, then adjust for clock (12 o'clock = 0°)
      if (angle < 0) angle += 360; // Ensure positive angle
      console.log('Calculated angle:', angle);
      setClockAngle(angle);
      const minutesToAdd = Math.round((angle / 360) * 60);
      setTimeToAdd(minutesToAdd);
      drawClock(angle); // Redraw immediately
    }
  };

  const handleMouseUp = (e) => {
    console.log('Mouse up at:', e.clientX, e.clientY);
    setIsDragging(false);
  };

  const handleSubmit = () => {
    onSubmit(timeToAdd / 60);
    setTimeToAdd(0);
    setClockAngle(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Log Time for {taskTitle}</h2>
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
          <canvas
            ref={canvasRef}
            id="clockCanvas"
            width="200"
            height="200"
            style={{ border: '1px solid #fff', cursor: 'pointer' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          ></canvas>
          <p style={{ color: '#ccc', textAlign: 'center', marginTop: '10px' }}>
            Time to add: {timeToAdd} minutes
          </p>
        </div>
        <button className="modal-close-button" onClick={handleSubmit}>Submit Time</button>
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
          style={{ marginLeft: '10px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TimeLogModal;