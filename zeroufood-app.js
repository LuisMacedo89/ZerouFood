// ZerouFood — Integração Supabase V3

async function zfGetSession() {
  const { data, error } = await zeroufoodSupabase.auth.getSession();
  if (error) return null;
  return data?.session || null;
}

async function zfGetCurrentUser() {
  const session = await zfGetSession();
  return session?.user || null;
}

async function zfLogin(email, password) {
  const { data, error } = await zeroufoodSupabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function zfSignup(email, password, name, role = "seller") {
  const { data, error } = await zeroufoodSupabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } }
  });
  if (error) throw error;

  if (data?.user) {
    await zeroufoodSupabase.from("profiles").upsert({
      id: data.user.id,
      name,
      email,
      role
    });
  }
  return data;
}

async function zfLogout() {
  await zeroufoodSupabase.auth.signOut();
  window.location.href = "index.html";
}

async function zfGetProfile(userId) {
  const { data, error } = await zeroufoodSupabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Perfil não encontrado:", error.message);
    return null;
  }
  return data;
}

async function zfEnsureProfile(user) {
  if (!user) return null;
  let profile = await zfGetProfile(user.id);
  if (profile) return profile;

  const name = user.user_metadata?.name || user.email || "Vendedor ZerouFood";
  const role = user.user_metadata?.role || "seller";

  const { data, error } = await zeroufoodSupabase
    .from("profiles")
    .upsert({
      id: user.id,
      name,
      email: user.email,
      role
    })
    .select()
    .single();

  if (error) {
    console.warn("Erro ao criar perfil:", error.message);
    return null;
  }
  return data;
}

async function zfRequireAuth() {
  const session = await zfGetSession();
  if (!session?.user) {
    const redirectTo = encodeURIComponent(window.location.pathname.split("/").pop() || "painel-vendedor.html");
    window.location.href = `login.html?redirect=${redirectTo}`;
    return null;
  }

  const profile = await zfEnsureProfile(session.user);
  return { session, user: session.user, profile };
}

async function zfGetMyStore(user, profile) {
  if (!user) throw new Error("Usuário não logado.");

  let { data: store, error } = await zeroufoodSupabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (store) return store;

  const storeName =
    profile?.name ||
    user.user_metadata?.name ||
    "Minha loja ZerouFood";

  const { data: newStore, error: createError } = await zeroufoodSupabase
    .from("stores")
    .insert({
      owner_id: user.id,
      name: storeName,
      city: "Cidade não informada",
      status: "approved"
    })
    .select()
    .single();

  if (createError) throw createError;
  return newStore;
}

async function zfUploadProductImage(file, productId) {
  if (!file) return null;

  const cleanName = file.name
    .normalize("NFD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-");

  const path = `${productId}/${Date.now()}-${cleanName}`;

  const { error } = await zeroufoodSupabase.storage
    .from("product-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) throw error;

  const { data } = zeroufoodSupabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

async function zfCreateProductWithImage(payload, file) {
  const auth = await zfRequireAuth();
  if (!auth) return null;

  const store = await zfGetMyStore(auth.user, auth.profile);

  const { data: product, error } = await zeroufoodSupabase
    .from("products")
    .insert({
      store_id: store.id,
      name: payload.name,
      description: payload.description || "",
      category: payload.category || "Outros",
      original_price: payload.original_price || null,
      sale_price: payload.sale_price,
      quantity: payload.quantity || 1,
      expiry_date: payload.expiry_date || null,
      status: "active"
    })
    .select()
    .single();

  if (error) throw error;

  if (file) {
    const imageUrl = await zfUploadProductImage(file, product.id);
    if (imageUrl) {
      const { error: imageError } = await zeroufoodSupabase
        .from("product_images")
        .insert({
          product_id: product.id,
          image_url: imageUrl,
          position: 0
        });

      if (imageError) throw imageError;
    }
  }

  return product;
}

async function zfLoadProducts(limit = 24) {
  const { data, error } = await zeroufoodSupabase
    .from("products")
    .select(`
      *,
      stores(id, name, city),
      product_images(image_url, position)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }

  return data || [];
}

async function zfLoadProductById(productId) {
  const { data, error } = await zeroufoodSupabase
    .from("products")
    .select(`
      *,
      stores(id, name, city),
      product_images(image_url, position)
    `)
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function zfLoadMyProducts() {
  const auth = await zfRequireAuth();
  if (!auth) return [];

  const store = await zfGetMyStore(auth.user, auth.profile);

  const { data, error } = await zeroufoodSupabase
    .from("products")
    .select(`
      *,
      product_images(image_url, position)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar meus produtos:", error);
    return [];
  }

  return data || [];
}

function zfMoney(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function zfFirstImage(product) {
  const images = product?.product_images || [];
  if (!images.length) return null;
  const sorted = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));
  return sorted[0]?.image_url || null;
}

async function zfRenderLoggedUser() {
  const session = await zfGetSession();
  const user = session?.user || null;

  let profile = null;
  if (user) profile = await zfEnsureProfile(user);

  const displayName =
    profile?.name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Usuário ZerouFood";

  const displayEmail = user?.email || "";

  document.querySelectorAll("[data-zf-user-name], .zf-user-name").forEach((el) => {
    el.textContent = displayName;
  });

  document.querySelectorAll("[data-zf-user-email], .zf-user-email").forEach((el) => {
    el.textContent = displayEmail;
  });

  document.querySelectorAll("[data-zf-user-initials], .zf-user-initials").forEach((el) => {
    const initials = displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "ZF";
    el.textContent = initials;
  });

  document.querySelectorAll("[data-zf-auth-logged-in]").forEach((el) => {
    el.style.display = user ? "" : "none";
  });

  document.querySelectorAll("[data-zf-auth-logged-out]").forEach((el) => {
    el.style.display = user ? "none" : "";
  });

  return { user, profile };
}

function zfBindLogoutButtons() {
  document.querySelectorAll("[data-zf-logout]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await zfLogout();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await zfRenderLoggedUser();
    zfBindLogoutButtons();
  } catch (err) {
    console.warn("Auth render error:", err.message);
  }
});
