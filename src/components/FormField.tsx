import React from 'react';

interface FormFieldProps {
	id: string;
	label: string;
	type: 'text' | 'date' | 'email' | 'password';
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	required?: boolean;
	className?: string;
}

export default function FormField({
	id,
	label,
	type,
	value,
	onChange,
	placeholder,
	required = false,
	className,
}: FormFieldProps) {
	return (
		<div className={className}>
			<label htmlFor={id} className="block text-spotify-white mb-2 font-medium">
				{label}
			</label>
			<input
				type={type}
				id={id}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className="w-full bg-spotify-black border border-spotify-medium-gray rounded-md p-3 text-spotify-white focus:outline-none focus:ring-2 focus:ring-spotify-green"
				required={required}
			/>
		</div>
	);
}
