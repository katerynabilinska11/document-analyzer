'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, useState } from "react"

export function InputFile() {
  const [data, setData] = useState<string>("")
  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("/api/analyzer", {
      method: "POST",
      body: formData,
    })
    const data = await response.json()
    setData(data)
  }

  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Choose document to analyze</Label>
        <Input type="file" onChange={onChange} />
      </div>
      <div>
        {data}
      </div>
    </>
  )
}
