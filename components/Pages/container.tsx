import React from "react";

type ContainerProps = {
  children?: React.ReactNode;
  className?: string;
};

export const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div
      className={`min-h-(--min-h-container-default) w-full bg-white rounded-xl p-5 ${className}`}
    >
      {children}
    </div>
    // <div
    //   className={`min-h-(--min-h-container-default) w-full bg-white rounded-xl p-5 ${className}`}
    // >
    //   {children}
    // </div>
  );
};

