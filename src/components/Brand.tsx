import { Link } from "react-router-dom";
export function Brand({ caption = "DESIGN COLLECTION" }: { caption?: string }) {
  return (
    <Link to="/" className="brand" aria-label="Dalton Styles 首页">
      <img
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        width="38"
        height="38"
        alt=""
      />
      <span>
        <strong>
          dalton<span className="brand-dot">.</span>
        </strong>
        <small>{caption}</small>
      </span>
    </Link>
  );
}
