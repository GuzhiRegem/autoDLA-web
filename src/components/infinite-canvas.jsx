import { Box } from "@mantine/core";
import { useRef } from "react";
import { ReactInfiniteCanvas } from "react-infinite-canvas";

function InfiniteCanvas (props) {
  const canvasRef = useRef();
  return (
    <Box h='400'>
      <ReactInfiniteCanvas
        ref={canvasRef}
        onCanvasMount={(mountFunc) => {
          mountFunc.fitContentToView({ scale: 1 });
        }}
      >
          {props.children}
      </ReactInfiniteCanvas>
    </Box>
  );
};

function CanvasBox(props) {
  return(<div style={{position: 'absolute', left: (props.x || 0), top: (props.y || 0), backgroundColor: 'white', border: 'solid black 0.2rem', padding: '1.5rem', borderRadius: '1rem'}}>{props.children}</div>)
}

function CanvasLine({ x1, y1, x2, y2, color = 'black', width = 2 }) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const widthAbs = Math.abs(x2 - x1);
  const heightAbs = Math.abs(y2 - y1);

  return (
    <svg
      style={{
        position: 'absolute',
        left,
        top,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 0
      }}
      width={widthAbs || 1}
      height={heightAbs || 1}
    >
      <line
        x1={x1 - left}
        y1={y1 - top}
        x2={x2 - left}
        y2={y2 - top}
        stroke={color}
        strokeWidth={width}
      />
    </svg>
  );
}
export {InfiniteCanvas, CanvasBox, CanvasLine}

// ReactDOM.render(<InfiniteCanvas />, document.getElementById("root"));