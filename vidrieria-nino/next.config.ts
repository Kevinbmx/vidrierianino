import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos'],
  },
  
  // Configuración para hot reload en Docker
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },

  // Configuración para Next.js 15
  experimental: {
    serverActions: {},  // Configuración correcta para serverActions
    turbo: undefined   // Eliminado porque está deprecado
  },

  // Turbopack config (estable en Next.js 15)
  turbopack: {
    resolveAlias: {
      // Configura tus alias aquí si los necesitas
    }
  },

  // Mejora el rendimiento en Docker
  output: 'standalone',

  // Configuración para evitar problemas de permisos
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hora
    pagesBufferLength: 10
  }
}

export default nextConfig