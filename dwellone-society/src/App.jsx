import emailjs from "@emailjs/browser";
import { useState } from 'react';
import { supabase } from './utils/supabase';

function App() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async () => {
    const { data, error } = await supabase.from("societies").insert({
      name: name,
      address: address,
      created_at: new Date().toISOString(),
    }).select()
    if (error) {
      alert(error.message)
    }

    else {
      //  const { data, error } = await supabase.from("societies").select("id")

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            email: email,
            name: name,
            company: "DwellOne",
            societyID: data[0].id,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        alert("Data inserted successfully and email sent")
        setName("")
        setAddress("")
      } catch (error) {
        console.log(error);

      }

    }
  }
  return (
    <>
      <h1 className='text-2xl font-bold' >Welcome TO DwellOne Society Registration</h1>
      <input className='border border-gray-300 rounded-md px-4 py-2 m-2' type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className='border border-gray-300 rounded-md px-4 py-2 m-2' type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <input className='border border-gray-300 rounded-md px-4 py-2 m-2' type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className='bg-blue-500 text-white px-4 py-2 rounded-md m-2' onClick={handleSubmit}>Submit</button>
    </>
  )
}

export default App
