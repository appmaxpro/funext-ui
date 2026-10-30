import { createRelationSelectorConfig, RelationSelector } from './relation-selector.js';
import type { SxComponentProps } from '~/ui';

/**
 * Single relation input component
 */
export interface SingleRelationInputProps<T = any> extends SxComponentProps {
    config: Parameters<typeof createRelationSelectorConfig<T>>[0];
    disabled?: boolean;
    className?: string;
    /**
     * @description
     * Custom text for the selector label,
     * defaults to `Select item` or `Select items`
     */
    selectorLabel?: React.ReactNode;
}

export function SingleRelationInput<T>({
    value,
    onChange,
    config,
    disabled,
    className,
    selectorLabel,
}: Readonly<SingleRelationInputProps<T>>) {
    const singleConfig = createRelationSelectorConfig<T>({
        ...config,
        multiple: false,
    });

    return (
        <RelationSelector
            config={singleConfig}
            value={value}
            selectorLabel={selectorLabel}
            onChange={newValue => onChange(newValue as string)}
            disabled={disabled}
            className={className}
        />
    );
}

/**
 * Multi relation input component
 */
export interface MultiRelationInputProps<T = any> extends SxComponentProps {
    config: Parameters<typeof createRelationSelectorConfig<T>>[0];
    disabled?: boolean;
    className?: string;
    selectorLabel?: React.ReactNode;
}

export function MultiRelationInput<T>({
    value,
    onChange,
    config,
    disabled,
    className,
    selectorLabel,
}: Readonly<MultiRelationInputProps<T>>) {
    const multiConfig = createRelationSelectorConfig<T>({
        ...config,
        multiple: true,
    });

    return (
        <RelationSelector
            config={multiConfig}
            value={value}
            onChange={newValue => onChange(newValue as string[])}
            disabled={disabled}
            className={className}
            selectorLabel={selectorLabel}
        />
    );
}
/*
(MultiRelationInput as DashboardFormComponent).metadata = {
    isListInput: true,
};*/
