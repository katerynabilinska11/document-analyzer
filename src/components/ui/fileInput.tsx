'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, useState } from "react"

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function InputFile() {
  const [data, setData] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true)
    setData("")
    // @ts-ignore
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("/api/analyzer", {
      method: "POST",
      body: formData,
    })
    const data = await response.json()
    setData(data)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input type="file" onChange={onChange} />
      </div>
      <div>
        {isLoading && <p>Loading...</p>}
        {data && <Markdown remarkPlugins={[remarkGfm]}>{data}</Markdown>}
      </div>
    </div>
  )
}
