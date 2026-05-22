export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#EEF0F6' }} />
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#757FEF', borderTopColor: 'transparent' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: '#A9A9C8' }}>{text}</p>
    </div>
  );
}
