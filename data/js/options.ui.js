/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";

    console.debug("Loading options.ui.js ...");
    
    var optionsUI = $("#dialogOptions").find(".form-horizontal");

    optionsUI.append($("<div class='control-group'>", {})
        .append($("<label class='control-label' for='inputEmail'>Email</label>"))
        .append($("<div class='controls'>", {})
            .append($("<input type='text' id='inputEmail' placeholder='Email'>", {
                
            })
        )
        )
    )
    
    optionsUI.append($("<div class='control-group'>", {})
        .append($("<label class='control-label' for='inputEmail'>Email</label>"))
        .append($("<div class='controls'>", {})
            .append($("<input type='text' id='inputEmail' placeholder='Email2'>", {
                
            })
        )
        )
    )
    
    optionsUI.append($("<div class='control-group'>", {})
        .append($("<label class='control-label' for='inputEmail'>Email</label>"))
        .append($("<div class='controls'>", {})
            .append($("<input type='text' id='inputEmail' placeholder='Email3'>", {
                
            })
        )
        )
    )        
/*
           <div class="control-group">
                <label class="control-label" for="inputEmail">Email</label>
                <div class="controls">
                    <input type="text" id="inputEmail" placeholder="Email">
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="inputPassword">Password</label>
                <div class="controls">
                    <input type="password" id="inputPassword" placeholder="Password">
                </div>
            </div>
            <div class="control-group">
                <div class="controls">
                    <label class="checkbox">
                        <input type="checkbox">
                        Remember me </label>
                    <button type="submit" class="btn">
                        Sign in
                    </button>
                </div>
            </div>
        </form> 
 */
    
});