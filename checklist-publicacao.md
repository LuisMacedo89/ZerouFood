# Checklist de Publicação — ZerouFood

## 1. Domínio
- Comprar domínio: `zeroufood.com.br` ou similar.
- Configurar DNS apontando para a Vercel.

## 2. Hospedagem
- Criar conta na Vercel.
- Criar repositório no GitHub.
- Subir arquivos do projeto.
- Importar o projeto na Vercel.

## 3. Banco de dados
- Criar projeto no Supabase.
- Rodar `supabase-schema.sql`.
- Criar tabelas: profiles, stores, products, product_images, offers, orders.

## 4. Fotos dos produtos
- Criar bucket `product-images`.
- Configurar upload com limite de tamanho.
- Aceitar JPG, PNG e WebP.

## 5. Autenticação
- Ativar login por email/senha.
- Separar perfis: comprador, vendedor e admin.

## 6. Admin
- Aprovar vendedores.
- Moderar produtos.
- Pausar produtos problemáticos.
- Acompanhar pedidos.

## 7. Segurança básica
- Criar regras de acesso no Supabase.
- Vendedor só edita seus próprios produtos.
- Comprador só vê seus próprios pedidos e ofertas.
- Admin pode moderar tudo.

## 8. Próximo avanço técnico
- Trocar armazenamento atual em navegador por Supabase.
- Transformar páginas HTML em app organizado, preferencialmente React/Next.js.