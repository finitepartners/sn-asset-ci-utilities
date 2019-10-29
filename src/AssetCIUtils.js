var AssetCIUtils = Class.create();
AssetCIUtils.prototype = {
  initialize: function() {},

  type: 'AssetCIUtils'
};

AssetCIUtils.addCIClassToCategory = function(categoryID, ciClass) {
  var modelCategory = new GlideRecord('cmdb_model_category');
  modelCategory.get('sys_id', categoryID);
  modelCategory.cmdb_ci_class = ciClass;
  modelCategory.setWorkflow(false);
  modelCategory.update();
};

AssetCIUtils.addAssetClassToCategory = function(categoryID, assetClass) {
  var modelCategory = new GlideRecord('cmdb_model_category');
  modelCategory.get('sys_id', categoryID);
  modelCategory.asset_class = assetClass;
  modelCategory.setWorkflow(false);
  modelCategory.update();
};

AssetCIUtils.createCIsFromAssets = function(categoryID) {
  // var aci = new AssetandCI();
  var asset = new GlideRecord('alm_asset');
  asset.addQuery('model_category', categoryID);
  asset.addQuery('ci', '');
  asset.query();
  while (asset.next()) {
    AssetCIUtils._createCI(asset);
  }
};

AssetCIUtils._createCI = function(asset) {
  // retrieve CI class from the model category if model doesn't override
  // it as
  // consumable or no tracking

  // Skip if we already have a CI
  if (!asset.ci.nil()) {
    // eslint-disable-next-line servicenow/minimize-gs-log-print
    gs.log('Duplicate CI generation prevented for asset ' + asset.display_name);
    return;
  }

  // Is there a CI out there with this asset?
  var otherCI = new GlideRecord('cmdb_ci');
  otherCI.addQuery('asset', asset.sys_id);
  otherCI.setLimit(1);
  otherCI.query();
  if (otherCI.next()) {
    asset.ci = otherCI.sys_id;
    asset.update();
    // eslint-disable-next-line servicenow/minimize-gs-log-print
    gs.log('Duplicate CI generation (existing CI) prevented for asset ' + asset.display_name);
    return;
  }

  var ciClass = '';
  // if ('leave_to_category' == asset.model.asset_tracking_strategy
  // .toString())
  ciClass = asset.model_category.cmdb_ci_class.toString();

  if (ciClass != '') {
    var ci = new GlideRecord(ciClass);
    ci.initialize();
    ci.asset = asset.sys_id;
    // in the absence of a calculated name for CIs, set
    // something so links don't appear blank
    ci.name = asset.model.name;
    // Populate manufacturer
    ci.manufacturer = asset.model.manufacturer;

    // inherit values from asset for shared fields
    var sync = new AssetAndCISynchronizer();
    sync.syncRecordsWithoutUpdate(asset, ci, 'cmdb_ci', false);

    // insert CI record and stick its reference in the asset
    asset.ci = ci.insert();
    asset.update();
  }
};
