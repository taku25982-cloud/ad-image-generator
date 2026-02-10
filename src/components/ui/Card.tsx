// ========================================
// Card コンポーネント
// ========================================

import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'bordered';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: ReactNode;
}

const variants: Record<string, string> = {
    default: 'card',
    glass: 'card-glass',
    bordered: 'bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl',
};

const paddings: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({
    variant = 'default',
    hover = false,
    padding = 'md',
    children,
    className = '',
    ...props
}: CardProps) {
    return (
        <div
            className={`${variants[variant]} ${paddings[padding]} ${className} ${hover ? '' : 'hover:transform-none hover:shadow-[var(--shadow-card)]'
                }`}
            {...props}
        >
            {children}
        </div>
    );
}

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    );
}

// Card Title
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }: CardTitleProps) {
    return (
        <Component className={`text-lg font-semibold text-[var(--text-primary)] ${className}`} {...props}>
            {children}
        </Component>
    );
}

// Card Description
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
}

export function CardDescription({ children, className = '', ...props }: CardDescriptionProps) {
    return (
        <p className={`text-sm text-[var(--text-secondary)] mt-1 ${className}`} {...props}>
            {children}
        </p>
    );
}

// Card Content
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
}

// Card Footer
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
    return (
        <div className={`mt-4 pt-4 border-t border-[var(--border-subtle)] ${className}`} {...props}>
            {children}
        </div>
    );
}
