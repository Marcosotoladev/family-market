// src/components/store/SocialLinksComponent.js
import { Facebook, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';

const SocialLinksComponent = ({ socialLinks, storeConfig }) => {
  if (!socialLinks) return null;

  const socialPlatforms = [
    {
      key: 'facebook',
      icon: Facebook,
      name: 'Facebook',
      color: 'hover:text-blue-600'
    },
    {
      key: 'instagram',
      icon: Instagram,
      name: 'Instagram',
      color: 'hover:text-pink-600'
    },
    {
      key: 'twitter',
      icon: Twitter,
      name: 'X (Twitter)',
      color: 'hover:text-gray-900'
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      name: 'LinkedIn',
      color: 'hover:text-blue-700'
    },
    {
      key: 'website',
      icon: Globe,
      name: 'Sitio Web',
      color: 'hover:text-green-600'
    }
  ];

  // Filtrar solo las redes sociales que tienen URL
  const activeSocialLinks = socialPlatforms.filter(platform => 
    socialLinks[platform.key] && socialLinks[platform.key].trim() !== ''
  );

  if (activeSocialLinks.length === 0) return null;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">Síguenos:</span>
      <div className="flex space-x-3">
        {activeSocialLinks.map(({ key, icon: Icon, name, color }) => (
          <a
            key={key}
            href={socialLinks[key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 text-gray-500 ${color} transition-colors duration-200 rounded-lg hover:bg-gray-100`}
            title={name}
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksComponent;