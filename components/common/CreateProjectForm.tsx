"use client";

import React, { useState } from "react";
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
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccount } from "wagmi";
import { createProject } from "@/lib/api/projectApi";

const CreateProjectForm = () => {
  const { isAuth, isAuthLoading } = useAuth();
  const { address } = useAccount();
  const router = useRouter();

  // Form Schema for shadcn-ui form
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Project name must be at least 2 characters.",
    }),
    description: z.string(),
    projectAddress: z.string(),
    email: z.string().email(),
    instagram: z.string().optional(),
    github: z.string().optional(),
    telegram: z.string().optional(),
    twitter: z.string().optional(),
  });

  // Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      projectAddress: "",
      email: "",
      instagram: "",
      github: "",
      telegram: "",
      twitter: "",
    },
  });

  // State for image upload
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [projectImage, setProjectImage] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle image upload
  const handleLogoImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setLogoImage(event.target.files[0]);
    }
  };

  const handleProjectImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setProjectImage(event.target.files[0]);
    }
  };

  // Handle image removal
  const removeLogoImage = () => {
    setLogoImage(null);
  };

  const removeProjectImage = () => {
    setProjectImage(null);
  };

  // Handle image click to open modal
  const openModalWithImage = (image: File) => {
    setModalImage(URL.createObjectURL(image));
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const isFormValid = () => {
    return (
      form.formState.isValid && logoImage !== null && projectImage !== null
    );
  };

  // Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!logoImage || !projectImage) {
      setErrorMessage("Please upload both logo and project image");
      return;
    }

    const formData = new FormData();
    formData.append("ownerAddress", address || "");

    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    formData.append("logo", logoImage);
    formData.append("projectImage", projectImage);

    try {
      const response = await createProject(formData);
      if (response.success) {
        console.log("Project created successfully", response);
        router.push("/");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API Error: ${error.message}`);
        setErrorMessage(
          error.message || "An error occurred while creating the project"
        );
      } else {
        console.error("An unknown error occurred");
        setErrorMessage("An unknown error occurred while creating the project");
      }
    }
  };

  const renderUnauthenticated = () => (
    <div>
      <h2>Please Connect Wallet & Sign In</h2>
    </div>
  );

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return renderUnauthenticated();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex gap-5 w-full">
          <div className="flex flex-col gap-5 w-1/4">
            <FormLabel>Logo Image*</FormLabel>
            <div className="border-2 border-dashed border-gray-300 rounded-lg aspect-square w-full flex items-center justify-center relative">
              {logoImage ? (
                <div className="relative h-full w-full">
                  <Image
                    src={URL.createObjectURL(logoImage)}
                    alt="Logo Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg cursor-pointer"
                    onClick={() => openModalWithImage(logoImage)}
                  />
                  <button
                    type="button"
                    onClick={removeLogoImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoImageChange}
                    className="hidden"
                    id="logoImage"
                  />
                  <label
                    htmlFor="logoImage"
                    className="text-gray-400 cursor-pointer text-center"
                  >
                    Upload & Browse
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-5 w-3/4">
            <FormLabel>Project Image*</FormLabel>
            <div className="border-2 border-dashed border-gray-300 rounded-lg aspect-[3/1] w-full flex items-center justify-center relative">
              {projectImage ? (
                <div className="relative h-full w-full">
                  <Image
                    src={URL.createObjectURL(projectImage)}
                    alt="Other Image Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg cursor-pointer"
                    onClick={() => openModalWithImage(projectImage)}
                  />
                  <button
                    type="button"
                    onClick={removeProjectImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProjectImageChange}
                    className="hidden"
                    id="projectImage"
                  />
                  <label
                    htmlFor="projectImage"
                    className="text-gray-400 cursor-pointer text-center"
                  >
                    Upload & Browse
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your project name"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Base Sepolia Address"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email address"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">@</span>
                      <Input
                        placeholder="username"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">@</span>
                      <Input
                        placeholder="username"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">@</span>
                      <Input
                        placeholder="username"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">@</span>
                      <Input
                        placeholder="username"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full h-full">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description"
                      {...field}
                      className="textarea rounded-2xl h-[95%]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="mt-[30px] lg:w-[10%] lg:ml-auto sm:w-[100%] bg-black"
          disabled={!isFormValid()}
        >
          Create Project
        </Button>
      </form>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Image Preview"
        className="flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        {modalImage && (
          <div className="relative">
            <Image
              src={modalImage}
              alt="Modal Preview"
              width={800}
              height={800}
              objectFit="contain"
            />
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              X
            </button>
          </div>
        )}
      </Modal>
    </Form>
  );
};

export default CreateProjectForm;
