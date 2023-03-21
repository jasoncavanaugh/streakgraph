import * as RadixModal from "@radix-ui/react-dialog";

function get_border_color(top_border: "red-500") {
  return "border-t-8 border-t-red-500";
}
interface Props {
  trigger: JSX.Element;
  on_open_change?: () => void;
  content: JSX.Element;
  top_border?: "red-500" 
}
export const Modal = ({ trigger, content, on_open_change, top_border}: Props) => {
  return (
    <RadixModal.Root onOpenChange={on_open_change}>
      <RadixModal.Trigger asChild>{trigger}</RadixModal.Trigger>
      <RadixModal.Portal>
        <RadixModal.Overlay className="modal-overlay bg-gray-500" />
        <RadixModal.Content className={`modal-open-animation fixed top-1/2 left-1/2 z-20 flex max-w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white py-3 px-5 drop-shadow-lg lg:px-8 lg:py-6 ${top_border ? get_border_color(top_border) : ""}`}>
          {content}
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );
};
