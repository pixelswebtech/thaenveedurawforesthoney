export default function PageHead({ title, description }) {
  return (
    <>
      <title>{title ? `${title} • Thaenveedu` : "Thaenveedu"}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="theme-color" content="#FFB300" />
    </>
  )
}
