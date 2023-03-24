
interface ISpinnerProps {
  className?: string;
}
export function Spinner({ className = "" }: ISpinnerProps) { 
  return (
    <div className={`animate-spin rounded-full border-t-transparent ${className}`}/>
  );
}
export default Spinner;
