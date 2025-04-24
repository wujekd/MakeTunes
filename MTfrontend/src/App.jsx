import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Mixer from './components/Mixer'

function App() {
  const [count, setCount] = useState(0)


  return (
    <>
    <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
      <section className='bg-red-200 col-span-7 row-span-2'>info</section>
      <section className='bg-blue-200 col-span-5 row-span-3'>submissions</section>
      <Mixer />
    </main>
    
    </>
  )
}


export default App
