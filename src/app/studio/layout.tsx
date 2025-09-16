export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 👇 Studio renders standalone (no Navbar, no Footer)
  return <>{children}</>
}
