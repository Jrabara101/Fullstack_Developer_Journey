import React from 'react'

import {BsFacebook, BsTwitterX, BsInstagram, BsLinkedin} from "react-icons/bs";

const HeaderTop = () => {
  return (
<div>
    <div>
        <div>
            <div>
              <div>
                <BsFacebook />
              </div>
              <div>
                <BsTwitterX />
              </div>
              <div>
                <BsInstagram />
              </div>
              <div>
                <BsLinkedin />
              </div>
            </div>
            <div class="text-grap-500 text-[12px]">
              <strong>FREE SHIPPING</strong>
              THIS WEEK ORDER OVER PHP 1199 
            </div>
            <div>
              <select name="currency" id="currency"></select>
                  <option value="PHP ₱">PHP ₱</option>
                  <option value="US $">US $</option>
                  <option value="Euro €">US €</option>

              <select name="language" id="language">
                  <option value="English">English</option>
                  <option value="Europe">Euro</option>
              </select>
            </div>
        </div>
    </div>
</div>
  )
}

export default HeaderTop