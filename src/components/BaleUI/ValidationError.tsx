// src/components/BaleUI/ValidationError.tsx
interface Props {
  message: string;
}

export default function ValidationError({ message }: Props) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "red" }}>
      <h3>خطا</h3>
      <p>{message}</p>
    </div>
  );
}
