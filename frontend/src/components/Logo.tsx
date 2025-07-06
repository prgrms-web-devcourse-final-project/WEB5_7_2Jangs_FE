interface LogoProps {
  withText?: boolean
}

export default function Logo({ withText = false }: LogoProps) {
  return (
    <div className="flex items-center space-x-2 w-full h-full">
      {withText ? (
        <img src="/logo_text.svg" alt="DocsA" />
      ) : (
        <img src="/logo.svg" alt="DocsA" />
      )}
    </div>
  )
}
