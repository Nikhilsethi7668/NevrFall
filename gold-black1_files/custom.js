document.addEventListener("DOMContentLoaded",function(){var canonicalLink=document.querySelector('link[rel="canonical"]');canonicalLink.href.includes("404")&&(window.location.href="https://overlaysnow.com/"),canonicalLink.href=="https://overlaysnow.com/cart"&&(window.location.href="https://overlaysnow.com/")});const gridDiscount=document.querySelector(".show_discount_model"),discountInput=document.querySelector("form #cart-discount"),applyBtn=document.querySelector("form.cart-discount__form .cart-discount__button");document.body.addEventListener("click",e=>{const viewBtn=e.target.closest(".view_all_coupon"),closeBtn=e.target.closest(".container_discount .close_model"),applyButton=e.target.closest(".apply_button");(viewBtn||closeBtn)&&gridDiscount.classList.toggle("hidden")}),$("body").on("click",".apply_button",function(){const discountCode=$(this).parents(".discount_code_passage").find(".offer_code").text().trim(),errorMessage=$(this).parents(".discount_code_passage").find(".cart-discount__error");$("#cart-discount").val(discountCode),$(".cart-discount__button").trigger("click"),setTimeout(function(){$(".show_add_discount_code .cart-discount__error").hasClass("hidden")||errorMessage.removeClass("hidden")},1500)}),$(document).ready(function(){const gridVariants=$(".cart_recommendations_variants_wrapper"),variantListContainer=$("#variant-list-container"),recommendedProducts=window.recommendedProducts;$("body").on("click",".add-btn",function(){console.log("add-btn: ",this);const productId=$(this).data("product-id"),product=recommendedProducts[productId];product&&variantListContainer.length&&(variantListContainer.empty(),product.variants.forEach(function(variant){const buttonLabel=variant.available?"Add to cart":"Sold out",addedLabel="Added",disabledAttr=variant.available?"":"disabled",variantHTML=`
          <div class="item-upsell" data-variant-id="${variant.id}" data-variant-title="${variant.title}">
            <div class="product-main-content">
              <div class="img">
                <img src="${product.featured_image}" alt="${product.title}">
              </div>
              <div class="details">
                <span class="sidecart-product-title">${product.title}</span>
                <div class="variant-title">
                  <span class="variant-title-element">${variant.title}</span>
                </div>
              </div>
            </div>
            <div class="item-price">
              <span>${variant.price}</span>
              <div class="quantity-handler-wrapper hidden">
                <div class="quantity-handler">
                  <span id="reduce-quantity">-</span>
                  <input name="quantity" type="number" class="item-quantity" value="1" min="1" step="1" inputmode="numeric">
                  <span id="increase-quantity">+</span>
                </div>
              </div>
              <product-form-component
                data-product-id="${variant.id}"
                data-product-url="${product.url}"
                on:submit="/handleSubmit"
              >
              <form method="post" action="/cart/add">
                <input type="hidden" name="id" value="${variant.id}">
                <button
                  id="${variant.id}"
                  type="submit"
                  name="add"
                  class="button add-to-cart-button variant-atc"
                  ${disabledAttr}
                >
                  <span class="add-to-cart-text">${buttonLabel}</span>                 
                  <span aria-hidden="true" class="add-to-cart-text--added" style="display:none;">
                    <span class="svg-wrapper add-to-cart-icon--added">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-checkmark">
                        <path d="M4.75439 10.7485L7.68601 14.5888C7.79288 14.7288 7.84632 14.7988 7.91174 14.8242C7.96907 14.8466 8.03262 14.8469 8.09022 14.8253C8.15596 14.8007 8.21026 14.7314 8.31886 14.5927L15.2475 5.74658" stroke="currentColor" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                    <span>${addedLabel}</span>
                  </span>
                </button>
              </form>
              </product-form-component>
            </div>
          </div>
        `;variantListContainer.append(variantHTML);const newlyAddedBtn=variantListContainer.find(`.variant-atc#${variant.id}`);newlyAddedBtn.length&&newlyAddedBtn.on("click",function(){const btn=$(this);btn.addClass("atc-added");const addToCartText=btn.find(".add-to-cart-text"),addedText=btn.find(".add-to-cart-text--added");addToCartText.length&&addedText.length&&(addToCartText.hide(),addedText.css("display","inline-flex"),setTimeout(function(){btn.removeClass("atc-added"),addToCartText.show(),addedText.hide()},2e3))})}),gridVariants.removeClass("hidden"))}),$(".variants_close_model").on("click",function(){gridVariants.addClass("hidden")})}),$(document).ready(function(){$(document).on("input",function(e){[{checkboxId:"gift-checkbox",variantId:47383490265340},{checkboxId:"gift-checkbox2",variantId:47383490101500}].forEach(({checkboxId,variantId})=>{const $checkbox=$("#"+checkboxId);if(!$checkbox.length||($(".cstm_add_to_cart").each(function(){$(this).off("click").on("click",function(){$checkbox.prop("checked")&&$checkbox.click()})}),e.target.id!==checkboxId))return;const $get_cart=$("#cstm_cart_drawer"),GiftWrapAdd=()=>{console.log("checked"),$get_cart.addClass("disable_cart"),$.ajax({type:"POST",url:"/cart/add.js",contentType:"application/json",data:JSON.stringify({items:[{id:variantId,quantity:1}]}),success:()=>{refreshCartAndPrice(variantId)},error:err=>{console.error("Add error:",err)}})},GiftWrapRemove=()=>{console.log("unchecked"),$get_cart.addClass("disable_cart"),$.ajax({type:"POST",url:"/cart/change.js",contentType:"application/json",data:JSON.stringify({id:`${variantId}`,quantity:0}),success:()=>{refreshCartAndPrice(variantId)},error:err=>{console.error("Remove error:",err)}})},Debounce=(fn,delay)=>{let timer;return()=>{clearTimeout(timer),timer=setTimeout(fn,delay)}},GiftWrapAddDebounced=Debounce(GiftWrapAdd,1e3),GiftWrapRemoveDebounced=Debounce(GiftWrapRemove,1e3);$.getJSON("/cart.js",function(cartData){const inCart=cartData.items.some(item=>item.id===variantId);!inCart&&$checkbox.prop("checked")&&(GiftWrapAddDebounced(),$checkbox.prop("disabled",!0),setTimeout(()=>{$checkbox.prop("disabled",!1)},1e3)),inCart&&!$checkbox.prop("checked")&&(GiftWrapRemoveDebounced(),$checkbox.prop("disabled",!0),setTimeout(()=>{$checkbox.prop("disabled",!1)},1e3))});function refreshCartAndPrice(targetVariantId){const oldCardWrapper=document.querySelector(".cart-items__wrapper .cart-items__table"),oldCartSummary=document.querySelector(".cart__summary-totals");fetch("/cart?section_id=main-cart").then(response=>response.text()).then(result=>{const doc=new DOMParser().parseFromString(result,"text/html"),newCardWrapper=doc.querySelector(".shopify-section .cart-items__wrapper .cart-items__table"),newCartSummary=doc.querySelector(".shopify-section .cart__summary-totals");oldCardWrapper.innerHTML=newCardWrapper.innerHTML,oldCartSummary.innerHTML=newCartSummary.innerHTML})}})})});
//# sourceMappingURL=/cdn/shop/t/177/assets/custom.js.map?v=160884125328587960301760431169
