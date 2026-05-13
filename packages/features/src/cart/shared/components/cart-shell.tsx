export const CartShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto flex justify-center">
      <div className="w-screen max-w-[616px] flex-1 basis-full py-8">
        {children}
      </div>
    </div>
  );
};
