import React, { useEffect, useState } from "react";

// 定义组件的 props 类型
interface CounterProps {
  initialCount?: number;
}

const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);

  // 使用 useEffect Hook 在计数更新时输出日志
  useEffect(() => {
    console.log(`Count updated: ${count}`);
  }, [count]);

  // 使用 ES6 箭头函数更新状态
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>当前数字: {count}</h2>
      <button onClick={increment} style={{ marginRight: "5px" }}>
        {"增加"}
      </button>
      <button onClick={decrement}>{"减少"}</button>
    </div>
  );
};

export default Counter;
