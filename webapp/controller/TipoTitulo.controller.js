sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("br.com.idxtecTipoTitulo.controller.TipoTitulo", {
		onInit: function(){
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		filtraTitulo: function(oEvent){
			var sQuery = oEvent.getParameter("query");

			var oFilter = new Filter("Descricao", FilterOperator.Contains, sQuery);
			
			var aFilters = [
				oFilter
			];

			this.getView().byId("tableTipoTitulo").getBinding("rows").filter(aFilters, "Application");
		},
	
		onRefresh: function(){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableTipoTitulo").clearSelection();
		},
		
		onIncluir: function(){
			var oDialog = this._criarDialog();
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getModel("view");
		
			oViewModel.setData({
				titulo: "Incluir novo tipo de título",
				codigoEdit: true,
				msgSalvar: "Tipo de título inserido com sucesso!"
			});
			
			oDialog.unbindElement();
			oDialog.setEscapeHandler(function(oPromise){
				if(oModel.hasPendingChanges()){
					oModel.resetChanges();
				}
			});
			
			var oContext = oModel.createEntry("/TipoTitulos", {
				properties: {
					"Codigo": "",
					"Descricao": ""
				}
			});
			
			oDialog.setBindingContext(oContext);
			oDialog.open();
		},
		
		onEditar: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableTipoTitulo");
			var nIndex = oTable.getSelectedIndex();
			var oViewModel = this.getModel("view");
			
			oViewModel.setData({
				titulo: "Editar tipo de título",
				codigoEdit: false,
				msgSalvar: "Tipo de título alterado com sucesso!"
			});
			
			if(nIndex === -1){
				MessageBox.warning("Selecione um tipo de título da tabela!");
				return;
			}
			
			var oContext = oTable.getContextByIndex(nIndex);
			
			oDialog.bindElement(oContext.sPath);
			oDialog.open();
		},
		
		onRemover: function(){
			var that = this;
			var oTable = this.byId("tableTipoTitulo");
			var nIndex = oTable.getSelectedIndex();
			
			if(nIndex === -1){
				MessageBox.warning("Selecione um tipo de título da tabela!");
				return;
			}
			
			MessageBox.confirm("Deseja remover esse tipo de título?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						that._remover(oTable, nIndex);
						MessageBox.success("Tipo de título removido com sucesso!");
					}
				} 
			});
		},
		
		onSaveDialog: function(){
			var oView = this.getView();
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			if(this._checarCampos(this.getView()) === true){
				MessageBox.information("Preencha todos os campos obrigatórios!");
				return;
			} else{
				oModel.submitChanges({
					success: function(oResponse){
						var erro = oResponse.__batchResponses[0].response;
						if(!erro){
							oModel.refresh(true);
							MessageBox.success(oViewModel.getData().msgSalvar);
							oView.byId("TipoTituloDialog").close();
							oView.byId("tableTipoTitulo").clearSelection();
						}
					}
				});
			}
		},
		
		onCloseDialog: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			if(oModel.hasPendingChanges()){
				oModel.resetChanges();
			}
			
			this.byId("TipoTituloDialog").close();
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath, {
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				}
			});
		},
		
		_criarDialog: function(){
			var oView = this.getView();
			var oDialog = this.byId("TipoTituloDialog");
			
			if(!oDialog){
				oDialog = sap.ui.xmlfragment(oView.getId(), "br.com.idxtecTipoTitulo.view.TipoTituloDialog", this);
				oView.addDependent(oDialog); 
			}
			return oDialog;
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("descricao").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		getModel: function(sModel) {
			return this.getOwnerComponent().getModel(sModel);
		}
	});
});