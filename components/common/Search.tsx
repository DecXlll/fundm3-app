"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Input } from '../ui/input';
import { useRouter, useSearchParams } from 'next/navigation';

const Search = ({ placeholder = 'Search title...' }: { placeholder?: string }) => {
    const [query, setQuery] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <div className="flex-center min-h-[54px] w-full overflow-hidden rounded-full bg-gray-200 px-4 py-2">
          <Image src="/assets/icons/search.svg" alt="search" width={24} height={24} />
          <Input 
            type="text"
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            className="p-regular-16 border-0 bg-grey-50 outline-offset-0 placeholder:text-grey-500 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-200"
          />
        </div>
      )
}

export default Search