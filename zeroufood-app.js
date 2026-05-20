// ZerouFood — Integração inicial Supabase

async function zfGetCurrentUser() {
  const { data, error } = await zeroufoodSupabase.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

async function zfLogin(email, password) {
  const { data, error } = await zeroufoodSupabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function zfSignup(email, password, name, role = "seller") {
  const { data, error } = await zeroufoodSupabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data?.user) {
    await zeroufoodSupabase.from("profiles").insert({
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

async function zfUploadProductImage(file, productId) {
  const safeName = `${Date.now()}-${file.name}`.replaceAll(" ", "-");
  const path = `${productId}/${safeName}`;

  const { error } = await zeroufoodSupabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = zeroufoodSupabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

async function zfCreateProduct(product) {
  const { data, error } = await zeroufoodSupabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function zfSaveProductImage(productId, imageUrl, position = 0) {
  const { data, error } = await zeroufoodSupabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      position
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function zfLoadProducts() {
  const { data, error } = await zeroufoodSupabase
    .from("products")
    .select(`
      *,
      stores(name, city),
      product_images(image_url, position)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }

  return data || [];
}

async function zfCreateOffer(productId, buyerId, sellerId, amount, message = "") {
  const { data, error } = await zeroufoodSupabase
    .from("offers")
    .insert({
      product_id: productId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount,
      message,
      status: "sent"
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function zfCreateOrder(productId, buyerId, sellerId, amount, paymentMethod) {
  const { data, error } = await zeroufoodSupabase
    .from("orders")
    .insert({
      product_id: productId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount,
      payment_method: paymentMethod,
      status: "pending"
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
