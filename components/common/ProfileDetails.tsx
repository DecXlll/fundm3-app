"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { EXTERNAL_URLS } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import {
  getProfileDetail,
  updateProfile,
  UserProfileResponse,
} from "@/lib/api/userApi";

const formSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").nullable(),
  address: z.string(),
  fid: z.number().int().positive().nullable(),
  email: z.string().email().nullable(),
  instagram: z.string().nullable(),
  github: z.string().nullable(),
  telegram: z.string().nullable(),
  twitter: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const fieldDisplayNames = {
  address: "Address",
  name: "Name",
  email: "Email",
  fid: "FID",
  instagram: "Instagram",
  github: "GitHub",
  telegram: "Telegram",
  twitter: "X",
};

const fieldPlaceholders = {
  address: "0x...",
  name: "Your full name",
  email: "your.email@example.com",
  fid: "Farcaster ID",
  instagram: "username",
  github: "username",
  telegram: "username",
  twitter: "username",
};

const DefaultUserIcon = () => (
  <svg
    className="w-full h-full text-gray-300"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ProfileDetails = () => {
  const { isAuth, isAuthLoading } = useAuth();
  const { address } = useAccount();
  const [isEditMode, setIsEditMode] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: null,
      address: "",
      fid: null,
      email: null,
      instagram: null,
      github: null,
      telegram: null,
      twitter: null,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuth && address) {
        try {
          const data = await getProfileDetail(address);
          setProfileData(data);
          form.reset(data);
          setProfilePicture(data.warpcastPicture ?? null);
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        }
      }
    };

    fetchProfile();
  }, [isAuth, address, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const { fid, ...updateValues } = values;
      const updatedProfile = await updateProfile(updateValues);
      setProfileData(updatedProfile);
      setErrorMessage(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("API Error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while updating the profile"
      );
    }
  };

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <h2>Please Connect Wallet & Sign In</h2>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/5 flex justify-center md:justify-start">
        <div
          className="w-48 h-48 md:w-48 md:h-48 relative rounded-full overflow-hidden"
          style={{ border: "2px solid #cccccc" }}
        >
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile Picture"
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <DefaultUserIcon />
          )}
        </div>
      </div>
      <div className="w-full md:w-4/5">
        <Form {...form}>
          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 relative pb-16"
          >
            {[
              "address",
              "name",
              "email",
              "fid",
              "instagram",
              "github",
              "telegram",
              "twitter"
            ].map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof FormValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {
                        fieldDisplayNames[
                          fieldName as keyof typeof fieldDisplayNames
                        ]
                      }
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl className="flex-grow">
                        {["instagram", "github", "telegram","twitter"].includes(
                          fieldName
                        ) ? (
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">@</span>
                            <Input
                              placeholder={
                                fieldPlaceholders[
                                  fieldName as keyof typeof fieldPlaceholders
                                ]
                              }
                              {...field}
                              value={field.value || ""}
                              className="input-field flex-grow"
                              disabled={!isEditMode}
                            />
                          </div>
                        ) : (
                          <Input
                            placeholder={
                              fieldPlaceholders[
                                fieldName as keyof typeof fieldPlaceholders
                              ]
                            }
                            {...field}
                            value={field.value || ""}
                            className="input-field"
                            disabled={
                              fieldName === "address" ||
                              fieldName === "fid" ||
                              !isEditMode
                            }
                          />
                        )}
                      </FormControl>
                      {!isEditMode &&
                        field.value &&
                        ["fid", "instagram", "github", "telegram","twitter"].includes(
                          fieldName
                        ) && (
                          <Link
                            href={`${EXTERNAL_URLS[fieldName.toUpperCase()]}${
                              field.value
                            }`}
                            target="_blank"
                            className="whitespace-nowrap"
                          >
                            Link
                          </Link>
                        )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="absolute bottom-0 right-0 flex gap-3">
              {isEditMode ? (
                <>
                  <Button type="submit">Save</Button>
                  <Button
                    type="button"
                    onClick={() => {
                      form.reset(profileData || {});
                      setErrorMessage(null);
                      setIsEditMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditMode(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfileDetails;
