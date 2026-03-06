interface BodyProps {
  children: React.ReactNode;
}

const Body = ({ children }: BodyProps) => {
  return <main className="max-w-[1920px] min-w-[1024px] mx-auto flex-1 px-6 py-8">{children}</main>;
};

export default Body;
