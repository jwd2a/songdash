"use client"

interface UserAvatarProps {
  src?: string
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function UserAvatar({ src, alt, size = "md", className = "" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  }

  const fallbackSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg", 
    xl: "text-xl"
  }

  const initials = alt
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`font-semibold text-gray-600 ${fallbackSizes[size]}`}>
          {initials}
        </span>
      )}
    </div>
  )
}