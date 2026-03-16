interface BodyProps {
  children: React.ReactNode;
}

const Body = ({ children }: BodyProps) => {
  return <main className="max-w-[1920px] mx-auto flex-1 px-4 py-6 lg:px-6 lg:py-8">{children}</main>;
};

export default Body;
