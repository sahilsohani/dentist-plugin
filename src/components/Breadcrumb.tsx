import React from "react";

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="bg-gray-100 py-3" data-oid="iysfiwi">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        data-oid="m6lfs7k"
      >
        <div className="flex items-center space-x-2 text-sm" data-oid="75:qo.8">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-gray-400" data-oid="54cv-m9">
                  {">"}
                </span>
              )}
              {item.current ? (
                <span className="text-gray-900 font-medium" data-oid="ia19.j6">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href || "#"}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  data-oid="g9xfzg-"
                >
                  {item.label}
                </a>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;
