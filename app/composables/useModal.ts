import type { AllowedComponentProps, Component, VNodeProps } from "vue";

type InstancePropsOf<C> = C extends new (...args: never[]) => {
	$props: infer P;
}
	? P
	: never;

export type ModalResult<C> =
	InstancePropsOf<C> extends { onResolve?: (value: infer R) => unknown }
		? R
		: never;

export type ModalProps<C> = Omit<
	InstancePropsOf<C>,
	"onResolve" | keyof VNodeProps | keyof AllowedComponentProps
>;

type PropsArgs<C> =
	Record<string, never> extends ModalProps<C>
		? [props?: ModalProps<C>]
		: [props: ModalProps<C>];

export interface ModalEntry {
	id: number;
	component: Component;
	props: Record<string, unknown>;
	resolve: (value: unknown) => void;
}

const stack = shallowRef<ModalEntry[]>([]);
let lastId = 0;

function open<C extends Component>(
	component: C,
	...[props]: PropsArgs<C>
): Promise<ModalResult<C> | undefined> {
	return new Promise((resolve) => {
		stack.value = [
			...stack.value,
			{
				id: ++lastId,
				component,
				props: { ...props },
				resolve: resolve as (value: unknown) => void,
			},
		];
	});
}

function close(id: number, value?: unknown) {
	const entry = stack.value.find((e) => e.id === id);
	if (!entry) return;
	stack.value = stack.value.filter((e) => e.id !== id);
	entry.resolve(value);
}

const hasOpen = computed(() => stack.value.length > 0);

export function useModal() {
	return { open, hasOpen };
}

export function useModalStack() {
	return { stack, close };
}
