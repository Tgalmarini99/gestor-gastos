import { Star } from 'lucide-react'

export default function Wishlist() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Wishlist</h1>
      <p className="text-slate-400 text-sm mb-8">Productos que querés comprar</p>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
          <Star size={28} className="text-violet-500" />
        </div>
        <p className="text-slate-500 font-medium">Próximamente</p>
        <p className="text-slate-400 text-sm mt-1">Lista de deseos con estimación de compra</p>
      </div>
    </div>
  )
}
