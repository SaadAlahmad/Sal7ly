import React from 'react';
import { Link } from 'react-router-dom';
import { FaWrench, FaBolt, FaLeaf, FaBroom, FaTshirt, FaThLarge } from 'react-icons/fa';
import { MdCarpenter } from "react-icons/md";
import { GiBlacksmith, GiFreemasonry  } from "react-icons/gi";
import { BiSolidCarMechanic } from "react-icons/bi";
import '../css/CategoriesPage.css';

const categories = [
    { name: "Plumber", icon: <FaWrench /> },
    { name: "Carpenter", icon: <MdCarpenter /> },
    { name: "Blacksmith", icon: <GiBlacksmith /> },
    { name: "Electrician", icon: <FaBolt /> },
    { name: "Mechanic", icon: <BiSolidCarMechanic /> },
    { name: "Gardener", icon: <FaLeaf /> },
    { name: "Mason", icon: <GiFreemasonry /> },
    { name: "Cleaner", icon: <FaBroom /> },
    { name: "Tailor", icon: <FaTshirt /> },
    { name: "Tiler", icon: <FaThLarge /> },
];

const CategoriesPage = () => {
    return (
        <div className="categories-page">
            <div className="categories-page__intro">
                <h2 className="categories-page__intro-title">
                    Explore Our Service Categories | استكشف فئات الخدمات لدينا
                </h2>
                <p className="categories-page__description categories-page__description--en">
                    Find the right craftspeople to get your tasks done quickly and efficiently. Whether you need a plumber, electrician, or tailor, we've got you covered. 
                </p>
                <p className="categories-page__description categories-page__description--ar">
                    .ابحث عن الحرفيين المناسبين لإنجاز مهامك بسرعة وكفاءة. سواء كنت بحاجة إلى سباك، كهربائي، أو خياط، نحن هنا لخدمتك
                </p>
            </div>
            
            <h1 className="categories-page__title">Explore Categories</h1>
            
            <div className="categories-page__grid">
                {categories.map((category) => (
                    <Link
                        to={`/categories/${category.name.toLowerCase()}`}
                        className="categories-page__card"
                        key={category.name}
                    >
                        <div className="categories-page__card-icon">{category.icon}</div>
                        <div className="categories-page__card-name">{category.name}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoriesPage;