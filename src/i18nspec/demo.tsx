const config = {
  name: "张三",
  age: 18,
};

const otherValue = 42;

const useConfig = () => {
  return (
    <>
      {config.name}
      {otherValue}
    </>
  );
};

const anotherFunction = () => {
  return otherValue * 2;
};
