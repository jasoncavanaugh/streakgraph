import * as RadixModal from "@radix-ui/react-dialog";

interface Props {
  trigger: JSX.Element;
  onOpenChange?: () => void;
  content: JSX.Element;
}
export const Modal = ({ trigger, content, onOpenChange }: Props) => {
  return (
    <RadixModal.Root onOpenChange={onOpenChange}>
      <RadixModal.Trigger asChild>{trigger}</RadixModal.Trigger>
      <RadixModal.Portal>
        <RadixModal.Overlay className="modal-overlay bg-gray-500" />
        <RadixModal.Content className="modal-open-animation fixed top-1/2 left-1/2 z-20 flex max-w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white py-3 px-5 drop-shadow-lg lg:px-8 lg:py-6">
          {content}
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );
};
